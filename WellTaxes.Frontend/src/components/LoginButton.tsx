import { useMsal } from "@azure/msal-react";
import { getApiToken, msalScopes } from "../auth/msalConfig";
import { useEffect } from "react";

export const LoginButton = () => {
  const { instance } = useMsal();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getApiToken();
      console.log("Access token:", token);
    };

    fetchToken();
  }, []);
  const login = () => {
    instance.loginPopup({
      scopes: msalScopes,
      prompt: 'select_account'
    });
    
  };

  return <button onClick={login}>Login with Google / Microsoft</button>;
};
