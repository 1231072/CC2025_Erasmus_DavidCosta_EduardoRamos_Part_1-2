package com.cloudcomputing.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {




    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(

                "/",
                "/index.html",
                "/scripts/**",
                "/css/**",
                "/js/**",
                "/favicon.ico",
                "/h2-console/**",
                "/swagger-ui/**",
                "/v3/api-docs/**"
        );
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtFilter, // Deixe o Spring injetar aqui
                                                   JwtAuthenticationEntryPoint unauthorizedHandler) throws Exception { // Deixe o Spring injetar aqui
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // REGRAS DE ACESSO PÚBLICO (REST)
                        .requestMatchers("/api/auth/**").permitAll() // Login e Register

                        // REGRAS PROTEGIDAS
                        .requestMatchers("/api/**").authenticated() // Exigir autenticação JWT para os endpoints de dados

                        // REGRA CATCH-ALL
                        .anyRequest().authenticated()
                );

        // O filtro JWT só será aplicado às rotas que não foram ignoradas pelo WebSecurityCustomizer
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Lista de origens permitidas (incluindo o Azure HTTPS)
        configuration.setAllowedOrigins(List.of(
                "https://localhost:3000",
                "https://127.0.0.1:3000",
                "https://localhost:8080",
                "https://erasmus-cc2025-ui.azurewebsites.net",
                "https://erasmus-cc2025-api.azurewebsites.net"

        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}