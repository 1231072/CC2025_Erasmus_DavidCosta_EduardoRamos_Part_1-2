import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signIn, signUp } from 'aws-amplify/auth'; // Importação do Amplify v6
import { fetchAuthSession } from 'aws-amplify/auth';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState(''); // Cognito usa frequentemente email como username
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (isRegistering) {
                // REGISTO NA AWS
                await signUp({
                    username: username,
                    password: password,
                    options: { userAttributes: { email: email } }
                });
                setMessage('Registo feito! Verifique o seu email para confirmar.');
                setIsRegistering(false);
            } else {
                // LOGIN NA AWS
                const { isSignedIn } = await signIn({ username, password });

                if (isSignedIn) {
                    // Buscar o Token para enviar ao Spring Boot
                    const session = await fetchAuthSession();
                    const token = session.tokens.idToken.toString();

                    login(token); // Guarda no contexto e localStorage
                }
            }
        } catch (err) {
            console.error(err);
            setMessage(err.message || 'Erro na autenticação.');
        }
    };

    return (
        <section>
            <h2>{isRegistering ? 'Criar Conta Cognito' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required /><br/><br/>
                {isRegistering && (
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                )}
                <br/><br/>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br/><br/>
                <button type="submit">{isRegistering ? 'Registar na AWS' : 'Entrar'}</button>
            </form>
            {/* ... resto do seu layout ... */}
            {message && <p style={{ color: 'blue' }}>{message}</p>}
        </section>
    );
};

export default Login;