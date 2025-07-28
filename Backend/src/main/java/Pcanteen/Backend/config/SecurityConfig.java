package Pcanteen.Backend.config;


import Pcanteen.Backend.security.CustomUserDetailsService;
import Pcanteen.Backend.security.JwtAuthenticationFilter;
import Pcanteen.Backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;

//import org.apache.catalina.filters.CorsFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    
    

     @Autowired
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
		super();
		this.jwtAuthFilter = jwtAuthFilter;
		this.userDetailsService = userDetailsService;
	}

  /*   @Bean
     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
         http
             .cors(Customizer.withDefaults()) // 👈 Enables CORS with your CorsFilter bean
             .csrf(AbstractHttpConfigurer::disable)
             .authorizeHttpRequests(auth -> auth
                 .requestMatchers("/api/auth/**").permitAll()
                 .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // .requestMatchers("/api/menu/**").hasRole("ADMIN","EMPLOYEE")
                 .requestMatchers("/api/menu/**").permitAll()
                 //.requestMatchers("/api/menu/**").hasRole("ADMIN")
                // .requestMatchers("/api/transactions/**").hasRole("ADMIN")
                 .requestMatchers("/api/orders/**").permitAll()
                 .requestMatchers("/api/transactions/**").permitAll()
                 .requestMatchers("/api/feedback/notifications/my").authenticated()
                 .requestMatchers("/api/feedback/suggestions").authenticated()
                 .requestMatchers("/api/feedback/notifications/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                 .requestMatchers("/api/feedback/suggestions/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                 
                 .anyRequest().authenticated()
             )
             .sessionManagement(sess -> 
                 sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
             )
             .authenticationProvider(authenticationProvider())
             .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

         return http.build();
     }*/
     
     @Bean
     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
         http
             .cors(Customizer.withDefaults())
             .csrf(AbstractHttpConfigurer::disable)
             .authorizeHttpRequests(auth -> auth
                 .requestMatchers("/api/auth/**").permitAll()
                 // Admin-only endpoints
                 .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                 .requestMatchers("/api/feedback/notifications/create").hasAnyRole("ADMIN", "SUPER_ADMIN")
                 .requestMatchers("/api/feedback/suggestions/all").hasAnyRole("ADMIN", "SUPER_ADMIN")
                 .requestMatchers("/api/feedback/suggestions/respond/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                 
                 // Employee accessible endpoints
                 .requestMatchers("/api/feedback/notifications/my").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN")
                 .requestMatchers("/api/feedback/suggestions/create").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN")
                 .requestMatchers("/api/feedback/suggestions/my").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN")
                 
                 // Public endpoints
                 .requestMatchers("/api/menu/**").permitAll()
                 .requestMatchers("/api/orders/**").permitAll()
                 .requestMatchers("/api/transactions/**").permitAll()
                 .anyRequest().authenticated()
             )
             .sessionManagement(sess -> 
                 sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
             )
             .authenticationProvider(authenticationProvider())
             .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

         return http.build();
     }

	
	

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    
}

