package com.sentinel.auth.application.service;

import com.sentinel.auth.adapter.out.persistence.OrganizationRepository;
import com.sentinel.auth.adapter.out.persistence.UserRepository;
import com.sentinel.auth.application.dto.*;
import com.sentinel.auth.domain.model.User;
import com.sentinel.auth.domain.model.UserRole;
import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.common.config.JwtTokenProvider;
import com.sentinel.common.exception.BusinessException;
import com.sentinel.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    @Transactional
    public UserResponse register(RegisterRequest request, UUID organizationId) {
        organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        if (userRepository.existsByEmailAndOrganizationId(request.getEmail(), organizationId)) {
            throw new BusinessException("USER_EXISTS", "User with this email already exists");
        }

        User user = User.builder()
                .organizationId(organizationId)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(UserRole.ANALYST)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        auditService.logAction(organizationId, saved.getId(), AuditAction.USER_CREATED, EntityType.USER);
        log.info("User registered: {} in org {}", saved.getEmail(), organizationId);
        return UserResponse.from(saved);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, UUID organizationId) {
        User user = userRepository.findByEmailAndOrganizationId(request.getEmail(), organizationId)
                .orElseThrow(() -> new BusinessException("INVALID_CREDENTIALS", "Invalid email or password"));

        if (!user.isEnabled()) {
            throw new BusinessException("USER_DISABLED", "User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_CREDENTIALS", "Invalid email or password");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getOrganizationId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getOrganizationId());

        auditService.logAction(organizationId, user.getId(), AuditAction.USER_LOGIN, EntityType.USER);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600)
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("INVALID_TOKEN", "Invalid or expired refresh token");
        }

        UUID userId = UUID.fromString(jwtTokenProvider.getUserIdFromToken(refreshToken));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getOrganizationId(), user.getRole().name());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(3600)
                .user(UserResponse.from(user))
                .build();
    }
}
