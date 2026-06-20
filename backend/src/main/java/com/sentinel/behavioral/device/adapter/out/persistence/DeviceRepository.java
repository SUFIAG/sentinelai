package com.sentinel.behavioral.device.adapter.out.persistence;

import com.sentinel.behavioral.device.domain.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {

    Optional<Device> findByOrganizationIdAndFingerprint(UUID organizationId, String fingerprint);

    List<Device> findByOrganizationIdAndUserIdOrderByLastSeenDesc(UUID organizationId, String userId);
}
