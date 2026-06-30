package com.nextstep.Config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/alunos/**").permitAll()
                        .requestMatchers("/quizzes/**").permitAll()
                        .requestMatchers("/ranking/**").permitAll()
                        .requestMatchers("/resultados-quiz/**").permitAll()
                        .requestMatchers("/resultado-questao/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/professores/**").permitAll()
                        .requestMatchers("/turmas/**").permitAll()
                        .requestMatchers("/artigos/**").permitAll()
                        .requestMatchers("/respostas-artigo/**").permitAll()
                        .anyRequest().permitAll()
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://pmg-es-2026-1-ti4-3170100-nextstep.vercel.app",
                "https://activityschool.vercel.app",
                "https://nextstepschool.vercel.app",
                "https://achieveitidiomas.vercel.app"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}