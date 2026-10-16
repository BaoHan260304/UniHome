package com.exe201.rrms.repository;

import com.exe201.rrms.entity.CommunityNotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommunityNotificationSettingRepository extends JpaRepository<CommunityNotificationSetting, Long> {
    Optional<CommunityNotificationSetting> findByUserIdAndChannelId(Long userId, Long channelId);
}
