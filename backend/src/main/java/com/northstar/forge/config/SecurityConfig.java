package com.northstar.forge.config;
import com.northstar.forge.user.UserRepository;
import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer; import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.core.userdetails.*; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.security.web.SecurityFilterChain; import org.springframework.web.cors.*; import java.util.List;
@Configuration public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean UserDetailsService userDetailsService(UserRepository users){return email->users.findByEmailIgnoreCase(email).orElseThrow(()->new UsernameNotFoundException("Account not found"));}
 @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-origin}") String origin){CorsConfiguration c=new CorsConfiguration();c.setAllowedOrigins(List.of(origin));c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("Content-Type","X-XSRF-TOKEN"));c.setAllowCredentials(true);UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;}
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception{return http.cors(Customizer.withDefaults()).csrf(csrf->csrf.disable()).authorizeHttpRequests(a->a.requestMatchers("/api/auth/login","/api/health").permitAll().anyRequest().authenticated()).formLogin(f->f.disable()).httpBasic(b->b.disable()).build();}
}
