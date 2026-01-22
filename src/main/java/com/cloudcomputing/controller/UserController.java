package com.cloudcomputing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {

    /**
     * Endpoint 1: /api/profile
     * Mostra informações do utilizador e a Role reconhecida oficialmente pelo Spring.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Jwt jwt, Authentication auth) {
        // Extração de identidade com fallback
        String username = jwt.getClaimAsString("cognito:username");
        if (username == null) username = jwt.getSubject();

        String email = jwt.getClaimAsString("email");

        // Agora verificamos a Role através das authorities oficiais do Spring
        // que o nosso JwtAuthenticationConverter mapeou.
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_Admin"));

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("email", email != null ? email : "Não disponível (Access Token usado)");
        response.put("role", isAdmin ? "admin" : "user");
        response.put("authorities", auth.getAuthorities()); // Mostra o que o Spring leu
        response.put("all_claims", jwt.getClaims());

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint 2: /api/data
     * Filtra dados com base na autoridade reconhecida ou no device_id.
     */
    @GetMapping("/data")
    public ResponseEntity<?> getData(@AuthenticationPrincipal Jwt jwt, Authentication auth) {
        // 1. Identificar a Role (usando as autoridades mapeadas pelo Spring)
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_Admin"));

        // 2. Extrair o atributo customizado (Certifique-se de enviar o ID Token no React)
        String userDeviceId = jwt.getClaimAsString("custom:device_id");

        // Dados Simulados (Estes dados serão substituídos pela Base de Dados no próximo passo)
        List<Map<String, Object>> databaseRecords = List.of(
                Map.of("id", 1, "device_id", "E-001", "sensor_reading", 25.5, "status", "Online"),
                Map.of("id", 2, "device_id", "E-002", "sensor_reading", 30.1, "status", "Offline"),
                Map.of("id", 3, "device_id", "E-001", "sensor_reading", 22.0, "status", "Online")
        );

        // 3. Lógica de Decisão
        if (isAdmin) {
            // ADMIN: Vê absolutamente tudo
            return ResponseEntity.ok(Map.of(
                    "role", "admin",
                    "device_id", "Todos os Dispositivos",
                    "data", databaseRecords
            ));
        }

        // USER COMUM: Verificação do atributo
        if (userDeviceId == null || userDeviceId.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Acesso Negado",
                    "message", "O seu perfil não tem um dispositivo (custom:device_id) atribuído no Cognito."
            ));
        }

        // Filtrar a lista para conter apenas o que pertence ao utilizador
        List<Map<String, Object>> filteredData = databaseRecords.stream()
                .filter(record -> userDeviceId.equals(record.get("device_id")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "role", "user",
                "device_id", userDeviceId,
                "data", filteredData
        ));
    }
}