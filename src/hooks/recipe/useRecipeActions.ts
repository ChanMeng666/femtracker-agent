import { useCopilotChat } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { chatSuggestions } from "@/constants/recipe";

export const useRecipeActions = () => {
  const { appendMessage, isLoading } = useCopilotChat();

  useCopilotChatSuggestions({
    instructions: chatSuggestions,
  });

  const handleImproveRecipe = () => {
    if (!isLoading) {
      appendMessage(
        new TextMessage({
          content: "Improve the recipe",
          role: Role.User,
        })
      );
    }
  };

  return {
    handleImproveRecipe,
    isLoading
  };
}; 