import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchBugs = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_URL}/bugs/?_=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bugs:', error);
    throw error;
  }
};

export const fetchBugDetail = async (bugId) => {
  try {
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_URL}/bugs/${bugId}/?_=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bug ${bugId}:`, error);
    throw error;
  }
};

export const fetchBugModifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/bug_modifications/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bug modifications:', error);
    throw error;
  }
};

export const updateBugStatus = async (bugId, status) => {
  try {
    const response = await axios.put(`${API_URL}/bugs/${bugId}/`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating bug ${bugId} status:`, error);
    throw error;
  }
}; 