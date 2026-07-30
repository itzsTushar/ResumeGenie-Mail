export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] flex justify-center items-center">

      <div className="w-[450px] bg-white rounded-2xl shadow-lg p-8">

        <div className="flex flex-col items-center">

          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
            👤
          </div>

          <h1 className="text-2xl font-bold mt-4">
            Tushar Sharma
          </h1>

          <p className="text-gray-500">
            tushar@gmail.com
          </p>

        </div>

        <div className="mt-8 space-y-4">

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold">
              Phone Number
            </h2>

            <p className="text-gray-600">
              +91 9876543210
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold">
              Resume
            </h2>

            <p className="text-gray-600">
              No Resume Uploaded
            </p>
          </div>

        </div>

        <button
          className="mt-8 w-full h-11 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>

    </main>
  );
}
