import { fetchData, postData } from "./apiService";

const endpoints = {
  human: "human/",
  institutes: "institutes/",
  department: "department/",
  rating: "rating/",
  jobTitle: "job_title/",
  publicationType: "publication_type/",
  relationshipType: "relationship_type/",
  searchScientificMaterials: "search-scientific-materials/",
  mainSearchScientificMaterials: "main-search-scientific-materials/",
  addScientificMaterials: "add-scientific-materials/",
  notVerifyWork: "verification_of_work/",
  statistics: "statistic/",
};

export default class PostService {
  static fetchHuman() {
    return fetchData(endpoints.human);
  }

  static fetchInstitutes() {
    return fetchData(endpoints.institutes);
  }

  static fetchDepartment() {
    return fetchData(endpoints.department);
  }

  static fetchRating() {
    return fetchData(endpoints.rating);
  }

  static fetchJobTitle() {
    return fetchData(endpoints.jobTitle);
  }

  static fetchPublicationType() {
    return fetchData(endpoints.publicationType);
  }

  static fetchRelationshipType() {
    return fetchData(endpoints.relationshipType);
  }

  static searchScientificMaterials(filters) {
    return postData(endpoints.searchScientificMaterials, filters);
  }

  static mainSearchScientificMaterials(filters) {
    return postData(endpoints.mainSearchScientificMaterials, filters);
  }

  static addScientificMaterials(data) {
    return postData(endpoints.addScientificMaterials, data);
  }

  static NotVerifyWorks() {
    return fetchData(endpoints.verification_of_work);
  }
  static fetchStatistics() {
    return fetchData(endpoints.statistics);
  }
}
