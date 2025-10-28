package com.ojtechapi.spring.jwtoauth.service;

import com.ojtechapi.spring.jwtoauth.dtos.requests.CompanyCreateRequest;
import com.ojtechapi.spring.jwtoauth.entities.Company;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import com.ojtechapi.spring.jwtoauth.repositories.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing companies
 * Used by NLO Staff to manage partner companies
 */
@Service
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    /**
     * Get all companies
     */
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }
    
    /**
     * Get all active companies
     */
    public List<Company> getActiveCompanies() {
        return companyRepository.findByActiveTrue();
    }
    
    /**
     * Get companies created by specific NLO staff
     */
    public List<Company> getCompaniesByNLO(NLOProfile nloProfile) {
        return companyRepository.findByCreatedByNLO(nloProfile);
    }
    
    /**
     * Get company by ID
     */
    public Optional<Company> getCompanyById(UUID id) {
        return companyRepository.findById(id);
    }
    
    /**
     * Create a new company
     */
    @Transactional
    public Company createCompany(CompanyCreateRequest request, NLOProfile nloProfile) {
        // Check if company with same name or email already exists
        if (companyRepository.existsByName(request.getName())) {
            throw new RuntimeException("Company with this name already exists");
        }
        
        if (companyRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Company with this email already exists");
        }
        
        Company company = new Company();
        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());
        company.setLocation(request.getLocation());
        company.setEmail(request.getEmail());
        company.setPhone(request.getPhone());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setLogoUrl(request.getLogoUrl());
        company.setHrName(request.getHrName());
        company.setHrEmail(request.getHrEmail());
        company.setHrPhone(request.getHrPhone());
        company.setCreatedByNLO(nloProfile);
        company.setActive(true);
        
        return companyRepository.save(company);
    }
    
    /**
     * Update a company
     */
    @Transactional
    public Company updateCompany(UUID id, CompanyCreateRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Check if name is being changed and if new name already exists
        if (!company.getName().equals(request.getName()) && 
            companyRepository.existsByName(request.getName())) {
            throw new RuntimeException("Company with this name already exists");
        }
        
        // Check if email is being changed and if new email already exists
        if (!company.getEmail().equals(request.getEmail()) && 
            companyRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Company with this email already exists");
        }
        
        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());
        company.setLocation(request.getLocation());
        company.setEmail(request.getEmail());
        company.setPhone(request.getPhone());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setLogoUrl(request.getLogoUrl());
        company.setHrName(request.getHrName());
        company.setHrEmail(request.getHrEmail());
        company.setHrPhone(request.getHrPhone());
        
        return companyRepository.save(company);
    }
    
    /**
     * Delete a company
     */
    @Transactional
    public void deleteCompany(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Check if company has any associated jobs
        if (company.getJobs() != null && !company.getJobs().isEmpty()) {
            throw new RuntimeException("Cannot delete company with active job postings");
        }
        
        companyRepository.delete(company);
    }
    
    /**
     * Deactivate a company
     */
    @Transactional
    public Company deactivateCompany(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        company.setActive(false);
        return companyRepository.save(company);
    }
    
    /**
     * Activate a company
     */
    @Transactional
    public Company activateCompany(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        company.setActive(true);
        return companyRepository.save(company);
    }
}
