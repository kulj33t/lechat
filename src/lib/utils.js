export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

export const idOf = (value) => String(value?._id ?? value?.id ?? value ?? "");

export const sameId = (left, right) => idOf(left) === idOf(right);
