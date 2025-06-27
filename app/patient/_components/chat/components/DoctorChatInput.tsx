import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { DoctorChatInputProps } from "../types";

export const DoctorChatInput: React.FC<DoctorChatInputProps> = React.memo(({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="border-t p-4 flex-shrink-0">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={onKeyPress}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          className="flex-1"
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading || disabled}
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
});

DoctorChatInput.displayName = "DoctorChatInput";
