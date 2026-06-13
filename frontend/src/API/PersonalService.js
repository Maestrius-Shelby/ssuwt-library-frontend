import { fetchData } from "./apiService";

const endpoints = {
  scientificMaterialsStatistics: "scientific-materials-statistics/",
  scientificMaterialsForPerson: "scientific-materias-for-person/", 
};

export default class PersonalService {
  static fetchScientificMaterialsStatistics() {
    return fetchData(endpoints.scientificMaterialsStatistics);
  }

  static fetchScientificMaterialsForPerson() {
    return fetchData(endpoints.scientificMaterialsForPerson);
  }
}