import axios from 'axios';
import authService from './authService'; // To get the token
import { API_BASE_URL } from '../../apiConfig';

const API_URL = `${API_BASE_URL}/jobs`;

const getAuthHeaders = () => {
  const user = authService.getCurrentUser();
  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  }
  return {};
};

// For Employers+
const createJob = async (jobData: any) => {
  return axios.post(`${API_URL}`, jobData, { headers: getAuthHeaders() });
};

const updateJob = async (jobId: string | number, jobData: any) => {
  return axios.put(`${API_URL}/${jobId}`, jobData, { headers: getAuthHeaders() });
};

const deleteJob = async (jobId: string | number) => {
  return axios.delete(`${API_URL}/${jobId}`, { headers: getAuthHeaders() });
};

const getEmployerJobs = async (page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/employer?page=${page}&size=${size}`, { headers: getAuthHeaders() });

  return response.data; // Expected to be a Page<Job> object
};

const getEmployerJobById = async (jobId: string | number) => {
  const response = await axios.get(`${API_URL}/${jobId}`, { headers: getAuthHeaders() });
  return response.data;
};

// For Public/Students
const getAllActiveJobs = async (page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}?page=${page}&size=${size}`);
  return response.data; // Expected to be a Page<Job> object
};

const getActiveJobById = async (jobId: string | number) => {
  const response = await axios.get(`${API_URL}/${jobId}`);
  return response.data;
};

const searchActiveJobsByTitle = async (title: string, page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/search?title=${encodeURIComponent(title)}&page=${page}&size=${size}`);
  return response.data;
};


const jobService = {
  // Employer
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getEmployerJobById,
  // Public
  getAllActiveJobs,
  getActiveJobById,
  searchActiveJobsByTitle,
};

export default jobService;
