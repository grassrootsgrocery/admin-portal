export function Messaging() {
  const sectionHeader =
    "flex items-center gap-2 text-lg font-bold text-newLeafGreen lg:text-3xl";
  return (
    <div className="r flex h-1/4 flex-col">
      <h1 className={sectionHeader}>Recruitment</h1>
      <div className="b flex grow flex-wrap justify-between px-32">
        {/* Card */}
        <div className="g flex min-w-max flex-col">
          <h2 className="p text-2xl font-medium text-newLeafGreen">
            For Coordinators
          </h2>
          <textarea>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente
            natus odit cupiditate accusamus iure deleniti ducimus eum quos harum
            et voluptatibus ut voluptates, quisquam nesciunt numquam maiores
            aliquam dolorem debitis quia? Necessitatibus ducimus debitis fugit
            dolorum tempore porro harum explicabo reprehenderit esse commodi
            blanditiis quasi vitae ipsum nihil natus, asperiores fugiat. Libero
            neque porro, alias ipsa consequuntur labore recusandae reprehenderit
            magni quasi at voluptates quos. Corporis autem vero nobis amet quasi
            reprehenderit labore animi expedita facilis, excepturi nemo eius
            dolorem ipsa nisi tenetur provident! Ab placeat dolores dolore
            magnam alias tempore, neque, aliquid quibusdam suscipit fugiat,
            libero recusandae eligendi tenetur.
          </textarea>
          <button className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold">
            Recruit Coordinators
          </button>
        </div>
        <div className="g ">
          <h2 className="rounded border text-2xl font-medium text-newLeafGreen">
            For Participants
          </h2>
          <textarea>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente
            natus odit cupiditate accusamus iure deleniti ducimus eum quos harum
            et voluptatibus ut voluptates, quisquam nesciunt numquam maiores
            aliquam dolorem debitis quia? Necessitatibus ducimus debitis fugit
            dolorum tempore porro harum explicabo reprehenderit esse commodi
            blanditiis quasi vitae ipsum nihil natus, asperiores fugiat. Libero
            neque porro, alias ipsa consequuntur labore recusandae reprehenderit
            magni quasi at voluptates quos. Corporis autem vero nobis amet quasi
            reprehenderit labore animi expedita facilis, excepturi nemo eius
            dolorem ipsa nisi tenetur provident! Ab placeat dolores dolore
            magnam alias tempore, neque, aliquid quibusdam suscipit fugiat,
            libero recusandae eligendi tenetur.
          </textarea>
          <button className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold">
            Recruit Participants
          </button>
        </div>
      </div>
    </div>
  );
}
