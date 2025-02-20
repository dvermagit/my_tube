export const SearchInput = () => {
  return (
    <form>
      <div className="w-96  flex  text-gray-900 border hover:to-blue-500 rounded-l-full rounded-r-full p-0 pl-2 text-sm pr-0 ">
        <input
          id="default-search"
          className="w-full text-black border-none outline-none"
          placeholder="Search"
          required
        />

        <button className="bg-gray-200 font-bold py-2 px-4 border-l-0 rounded-r-full inline-flex items-center">
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};
