import { useEffect } from "react";

const getFocusedN = (): number | null => {
    const focused = document.querySelector("input[data-n]:focus");

    if (!focused) {
        return null;
    }

    const attrVal = focused.getAttribute("data-n");


    if (!attrVal) {
        return null;
    }

    return parseInt(attrVal);
};

const getAllCheckboxes = (): NodeListOf<HTMLInputElement> => document.querySelectorAll("input[data-n]");

export const useKeyboardNavigation = () => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event;

            if (key !== "ArrowUp" && key !== "ArrowDown") {
                return;
            }

            const checkboxes = getAllCheckboxes();
            const numberOfCheckboxes = checkboxes.length;

            if (!numberOfCheckboxes) {
                return;
            }

            const focusedN = getFocusedN();

            if (key === "ArrowUp") {
                // null or 0
                if (!focusedN) {
                    // last checkbox
                    checkboxes[checkboxes.length - 1].focus();
                } else {
                    // 1 prior
                    checkboxes[focusedN - 1].focus();
                }
            }

            if (key === "ArrowDown") {
                // not focused or last item focused
                if (focusedN === null || focusedN === checkboxes.length - 1) {
                    // first checkbox
                    checkboxes[0].focus();
                } else {
                    // 1 after
                    checkboxes[focusedN + 1].focus();
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    });
};
