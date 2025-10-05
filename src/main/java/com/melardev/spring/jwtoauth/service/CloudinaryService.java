package com.melardev.spring.jwtoauth.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    Map upload(MultipartFile file, String folder) throws IOException;
    Map uploadWithPreset(MultipartFile file, String folder, String preset) throws IOException;
    String uploadImage(MultipartFile file) throws IOException;
    String uploadPdf(MultipartFile file, String preset) throws IOException;
    void delete(String publicId) throws IOException;
}