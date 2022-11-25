import { useEffect, useState } from "react";

const defaultText = "Jason this is some awesome text that I am typing rn";
// Tailwind classes
const sectionHeader =
  "flex items-center gap-2 text-2xl font-bold text-newLeafGreen lg:text-3xl";
const recruitCard =
  "flex min-w-max grow flex-col gap-4 items-start lg:items-center";
const cardHeader = "text-xl lg:text-2xl font-semibold text-newLeafGreen";
const textArea =
  "grow overflow-scroll w-full resize-none rounded-md border-4 border-softGrayWhite py-2 px-4 text-base lg:text-xl";
const btn =
  "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold";

const makeKey = import.meta.env.VITE_MAKE_API_KEY;
export function Messaging() {
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    console.log("key", makeKey);
    setLoading(true);
    try {
      const resp = await fetch(
        "https://us1.make.com/api/v2/scenarios?teamId=1989&pg%5Blimit%5D=100",
        {
          headers: {
            method: "GET",
            Authorization: `Token ${makeKey}`,
          },
        }
      );
      const data = await resp.json();
      console.log("data", data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div className="flex h-1/3 flex-col gap-4">
      <h1 className={sectionHeader}>Recruitment</h1>
      <div className="flex grow flex-wrap gap-16 lg:px-32">
        {/* Card */}
        <div className={recruitCard}>
          <h2 className={cardHeader}>For Coordinators</h2>
          <textarea className={textArea} defaultValue={defaultText} />
          <button className={btn}>Recruit Coordinators</button>
        </div>
        {/* Card */}
        <div className={recruitCard}>
          <h2 className={cardHeader}>For Participants</h2>
          <textarea className={textArea} defaultValue={defaultText} />
          <button className={btn}>Recruit Participants</button>
        </div>
      </div>
      {/* <div className="h-16" /> */}
    </div>
  );
}
