import { fetchData, postData } from "./apiService";

const endpoints = {
  verificationOfWork: "verification-of-work/",
  verificationWorkList: "verification_of_work/",
  scientificMaterials: "scientific_materials/",
};

export default class VerifyService {
  static fetchVerificationOfWork() {
    return fetchData(endpoints.verificationWorkList);
  }

  static fetchScientificMaterials() {
    return fetchData(endpoints.scientificMaterials);
  }

  static fetchScientificMaterialsHumans() {
    return fetchData("scientific_materials_human/");
  }

  static async verifyWorks(workIds) {
    return postData(endpoints.verificationOfWork, { verification_ids: workIds });
  }

}
