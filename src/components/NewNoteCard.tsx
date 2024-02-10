import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "sonner"

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent] = useState("")

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)

    if(!e.target.value) {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(e: FormEvent) {
    e.preventDefault()

    if(!content) return

    onNoteCreated(content)

    setContent("")
    setShouldShowOnboarding(true)

    toast.success("Note created successfully")
  }

  let SpeechRecognition: SpeechRecognition | null = null

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable = "SpeechRecognition" in window || "webkitSpeechRecognition" in window

    if(!isSpeechRecognitionAPIAvailable) {
      return alert("Unfortunately your browser does not support the Recording API")
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    SpeechRecognition = new SpeechRecognitionAPI()

    SpeechRecognition.lang = "en-US"
    SpeechRecognition.continuous = true
    SpeechRecognition.maxAlternatives = 1
    SpeechRecognition.interimResults = true

    SpeechRecognition.onresult = (e) => {
      const transcription = Array.from(e.results).reduce((text, result) => text.concat(result[0].transcript), "")

      setContent(transcription)
    }

    SpeechRecognition.onerror = (e) => {
      console.error(e)
    }

    SpeechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if(SpeechRecognition !== null) {
      SpeechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">Add note</span>
        <p className="text-sm leading-6 text-slate-400">Record an audio note that will be automatically converted to text.</p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50"/>
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>
          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">Add note</span>
                { shouldShowOnboarding ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Start by <button type="button" className="font-medium text-lime-400 hover:underline" onClick={handleStartRecording}>recording an audio note</button> or <button type="button" className="font-medium text-lime-400 hover:underline" onClick={handleStartEditor}>use only text</button>, if you prefer.
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                    value={content}
                    onChange={handleContentChanged}
                  ></textarea>
                )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse"></div>
                Recording! (click to interupt)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
              >Save note</button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default NewNoteCard