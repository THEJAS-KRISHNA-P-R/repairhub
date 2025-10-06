package com.repairhub.repository;

import com.repairhub.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByRepairPostIdOrderByDateAsc(Long repairPostId);
    List<Comment> findByUserIdOrderByDateDesc(Long userId);
    List<Comment> findByParentIdOrderByDateAsc(Long parentId);
}


