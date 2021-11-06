import { useEffect } from "react";
import zxcvbn from "zxcvbn";

export default function () {
  useEffect(() => {
    console.log(zxcvbn);
  }, []);
  return <h1>Happy Website</h1>;
}
