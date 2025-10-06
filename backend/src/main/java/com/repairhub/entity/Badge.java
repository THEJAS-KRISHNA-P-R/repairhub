package com.repairhub.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "badges")
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeVariant variant;
    
    @OneToMany(mappedBy = "badge", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserBadge> userBadges;
    
    public enum BadgeVariant {
        DEFAULT, SECONDARY, OUTLINE
    }
    
    // Constructors
    public Badge() {}
    
    public Badge(String name, String description, BadgeVariant variant) {
        this.name = name;
        this.description = description;
        this.variant = variant;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BadgeVariant getVariant() {
        return variant;
    }
    
    public void setVariant(BadgeVariant variant) {
        this.variant = variant;
    }
    
    public List<UserBadge> getUserBadges() {
        return userBadges;
    }
    
    public void setUserBadges(List<UserBadge> userBadges) {
        this.userBadges = userBadges;
    }
}


