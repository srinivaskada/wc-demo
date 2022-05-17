import { Axios } from "axios";
declare class SurfApiHelper {
  private authToken;
  axios: Axios;
  constructor(authToken: string);
  prepareDeviceMediaStreaming(imei: string): Promise<{
    address: string;
    mediaToken: string;
  }>;
}
export default SurfApiHelper;
