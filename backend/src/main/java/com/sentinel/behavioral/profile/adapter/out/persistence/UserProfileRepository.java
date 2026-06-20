package com.sentinel.behavioral.profile.adapter.out.persistence;

import com.sentinel.behavioral.profile.domain.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    Optional<UserProfile> findByOrganizationIdAndUserId(UUID organizationId, String userId);
}
