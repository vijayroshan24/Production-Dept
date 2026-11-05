package com.northstar.forge.api;
import org.springframework.context.annotation.*; import org.springframework.security.authentication.AuthenticationManager; import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
@Configuration public class AuthenticationConfigurationAdapter {@Bean AuthenticationManager authenticationManager(AuthenticationConfiguration config)throws Exception{return config.getAuthenticationManager();}}
