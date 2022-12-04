import { useQuery } from "react-query";
import { Loading } from "../../components/Loading";
import { API_BASE_URL } from "../../httpUtils";
//Assets
import recruitment from "../../assets/recruitment.svg";

// Tailwind classes
const sectionHeader =
  "flex items-start gap-3 text-2xl font-bold text-newLeafGreen lg:text-3xl";
const sectionHeaderIcon = "w-8 lg:w-10";
const recruitCard =
  "flex min-w-max grow flex-col gap-4 items-start lg:items-center";
const cardHeader = "text-xl lg:text-2xl font-semibold text-newLeafGreen";
const textArea =
  "grow overflow-scroll w-full resize-none rounded-md border-4 border-softGrayWhite py-2 px-4 text-base lg:text-xl";
const btn =
  "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold";

export function Messaging() {
  const {
    data: volunteerRecruitmentTextData,
    status: volunteerRecruitmentTextStatus,
    error: volunteerRecruitmentTextError,
  } = useQuery(["fetchVolunteerRecruitmentTextBlueprint"], async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/messaging/volunteer-recruitment-text`
    );
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json();
  });
  const {
    data: coordinatorRecruitmentTextData,
    status: coordinatorRecruitmentTextStatus,
    error: coordinatorRecruitmentTextError,
  } = useQuery(["fetchCoordinatorRecruitmentTextBlueprint"], async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/messaging/coordinator-recruitment-text`
    );
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json();
  });

  const volunteerTextLoading =
    volunteerRecruitmentTextStatus === "loading" ||
    volunteerRecruitmentTextStatus === "idle";

  const coordinatorTextLoading =
    coordinatorRecruitmentTextStatus === "loading" ||
    coordinatorRecruitmentTextStatus === "idle";

  //UI
  return (
    <div className="flex h-1/3 flex-col gap-4">
      <h1 className={sectionHeader}>
        <img className={sectionHeaderIcon} src={recruitment} alt="people" />
        Recruitment
      </h1>
      <div className="flex grow flex-wrap gap-16 lg:px-32">
        {/* Coordinators Recruitment card */}
        <div className={recruitCard}>
          <h2 className={cardHeader}>For Coordinators</h2>
          {coordinatorTextLoading ? (
            <div className="relative w-full grow rounded-md border-4 border-softGrayWhite py-2 px-4">
              <Loading size="medium" thickness="thicc" />
            </div>
          ) : (
            <textarea
              className={textArea}
              defaultValue={coordinatorRecruitmentTextData}
            />
          )}
          <button className={btn}>Recruit Coordinators</button>
        </div>
        {/* Participants RecruitmentCard */}
        <div className={recruitCard}>
          <h2 className={cardHeader}>For Participants</h2>
          {volunteerTextLoading ? (
            <div className="relative w-full grow rounded-md border-4 border-softGrayWhite py-2 px-4">
              <Loading size="medium" thickness="thicc" />
            </div>
          ) : (
            <textarea
              className={textArea}
              defaultValue={volunteerRecruitmentTextData}
            />
          )}
          <button className={btn}>Recruit Participants</button>
        </div>
      </div>
      {/* <div className="h-16" /> */}
    </div>
  );
}
