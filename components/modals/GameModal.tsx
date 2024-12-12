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
  shareImage?: string;
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
  shareImage,
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="message whitespace-pre-line mb-4">
            {renderMessage()}
          </div>

          {shareImage && (
            <div className="mb-6 w-full">
              <img
                src={shareImage}
                alt="Game Result"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {showShare && (
              <button
                onClick={onShare}
                className="px-4 py-2 bg-orange-500 text-primary-foreground rounded hover:bg-orange-400 transition-colors">
                Share
              </button>
            )}
            {showRestart && (
              <button
                onClick={onRestart}
                className="px-4 py-2 bg-orange-500 text-primary-foreground rounded hover:bg-orange-400 transition-colors"
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
