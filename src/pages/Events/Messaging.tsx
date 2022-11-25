// const defaultText =
//   "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ad, fugit! Deleniti officiis repudiandae ratione iusto veritatis sunt! Ducimus eveniet eaque explicabo consequuntur eius. Ab distinctio non a, voluptatibus nam maiores, sunt iste animi aliquam sed aliquid vel delectus architecto atque voluptates doloremque, eligendi recusandae magnam minima? Asperiores ipsum quae doloremque iusto molestias nam placeat atque repellendus explicabo. Vitae dolores modi assumenda quo, officiis ad ipsa est numquam soluta suscipit voluptas porro obcaecati, aperiam temporibus hic explicabo dicta recusandae ullam commodi excepturi iste mollitia fugit inventore possimus. Placeat sint dicta autem sed unde pariatur amet in perspiciatis cum accusantium velit libero excepturi esse nam fuga iure, aliquam dolorem illo nisi ratione quis! Culpa molestias aperiam, obcaecati incidunt quasi ad placeat labore!";

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

export function Messaging() {
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
