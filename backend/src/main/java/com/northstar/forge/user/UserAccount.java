package com.northstar.forge.user;
import jakarta.persistence.*; import org.springframework.security.core.GrantedAuthority; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.userdetails.UserDetails; import java.util.*;
@Entity @Table(name="users") public class UserAccount implements UserDetails {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; @Column(nullable=false,unique=true) private String email; @Column(nullable=false) private String passwordHash; @Column(nullable=false) private String role; @Column(nullable=false) private boolean enabled=true;
 protected UserAccount(){} public UserAccount(String name,String email,String passwordHash,String role){this.name=name;this.email=email.toLowerCase();this.passwordHash=passwordHash;this.role=role;}
 public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getRole(){return role;}
 @Override public Collection<? extends GrantedAuthority> getAuthorities(){return List.of(new SimpleGrantedAuthority("ROLE_"+role));} @Override public String getPassword(){return passwordHash;} @Override public String getUsername(){return email;} @Override public boolean isAccountNonExpired(){return true;} @Override public boolean isAccountNonLocked(){return true;} @Override public boolean isCredentialsNonExpired(){return true;} @Override public boolean isEnabled(){return enabled;}
}
