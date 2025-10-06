package com.repairhub.repository;

import com.repairhub.entity.RepairPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairPostRepository extends JpaRepository<RepairPost, Long> {
    List<RepairPost> findByUserIdOrderByIdDesc(Long userId);
    List<RepairPost> findAllByOrderByIdDesc();
    List<RepairPost> findBySuccessOrderByIdDesc(Boolean success);
}


