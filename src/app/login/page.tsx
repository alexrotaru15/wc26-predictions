import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            World Cup 2026
          </h1>
          <p className="text-gray-600">Predictions League</p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-700">
              Sign in with your Twitch account to join prediction leagues and compete with friends!
            </p>
          </div>
        </div>

        <form
          action={async () => {
            "use server"
            await signIn("twitch", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
            </svg>
            Sign in with Twitch
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to participate in friendly competition and have fun predicting World Cup matches!
        </p>
      </div>
    </div>
  )
}
