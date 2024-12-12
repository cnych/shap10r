import { FC } from "react";
import { CorrectAnswer } from "@/components/CorrectAnswer";
import type { Solution } from "@/lib/types";

type MessageType =
  | string
  | { type: "correct-answer"; solution: Solution[] | null };

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: MessageType;
  showShare?: boolean;
  showRestart?: boolean;
  onShare?: () => void;
  onRestart?: () => void;
  buttonText?: string;
}

export const GameModal: FC<GameModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  showShare = false,
  showRestart = true,
  onShare,
  onRestart,
  buttonText = "Restart",
}) => {
  if (!isOpen) return null;

  const renderMessage = () => {
    if (message === null) return null;
    if (
      typeof message === "object" &&
      "type" in message &&
      message.type === "correct-answer"
    ) {
      return <CorrectAnswer solution={message.solution} />;
    }
    return String(message);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="message whitespace-pre-line mb-6">
            {renderMessage()}
          </div>

          <div className="flex gap-4 justify-center">
            {showShare && (
              <button
                onClick={onShare}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Share
              </button>
            )}
            {showRestart && (
              <button
                onClick={onRestart}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
