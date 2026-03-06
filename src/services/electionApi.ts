
export interface Province {
  id: number;
  province_number: string;
  province_en: string;
  province_np: string;
}

export interface District {
  id: number;
  disrict_number: string;
  disrict_name: string;
  disrict_name_np: string;
  province_number: string;
}

export interface Candidate {
  id: number;
  name_np: string;
  name_en: string;
  candidate_picture: string;
  party: string;
  party_name_np: string;
  party_logo: string;
  vote: number;
  is_elected: boolean;
  party_color: string;
  election_area: string;
  election_area_en: string;
  district: string;
  district_en: string;
  province: string;
  province_en: string;
  areaid: string;
  district_id: string;
  leading: boolean;
}

export interface ElectionResult {
  [constituency: string]: Candidate[];
}

export interface SearchResponse {
  status: boolean;
  counting: number;
  election_type: string;
  province: string;
  districts: string;
  district_en: string;
  province_en: string;
  data: ElectionResult;
}

const BASE_URL = '/api/proxy';

export const electionApi = {
  async getInitialData() {
    const response = await fetch(`${BASE_URL}/home`);
    const data = await response.json();
    
    const provinces = data.find((item: any) => item.type === 'provinces')?.data as Province[];
    const districts = data.find((item: any) => item.type === 'district')?.data as District[];
    
    return { provinces, districts };
  },

  async getParties() {
    const response = await fetch(`${BASE_URL}/parties`);
    const data = await response.json();
    return data.data;
  },

  async getProvincesMap() {
    const response = await fetch(`${BASE_URL}/provinces`);
    const data = await response.json();
    return data.data;
  },

  async searchResults(electionType: number, districtNumber: string): Promise<SearchResponse> {
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        election_type: electionType,
        district: districtNumber
      })
    });
    return await response.json();
  },

  async getSummary() {
    const response = await fetch(`${BASE_URL}/summary`);
    return await response.json();
  },

  async getNews() {
    const response = await fetch(`${BASE_URL}/news`);
    return await response.json();
  }
};
