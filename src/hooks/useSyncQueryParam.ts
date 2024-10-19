import { useEffect } from "react";

function useSyncQueryParam(paramName, setState) {
  useEffect(() => {
    // Get the query string from the URL
    const queryParams = new URLSearchParams(window.location.search);

    // Extract the parameter from the query string
    const valueFromQuery = queryParams.get(paramName);

    if (valueFromQuery) {
      // Use the existing setState function to update the state
      setState(valueFromQuery);

      // Remove the parameter from the query string
      queryParams.delete(paramName);

      // Update the URL without reloading the page
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [paramName, setState]); // Dependency array includes paramName and setState
}

export default useSyncQueryParam;
