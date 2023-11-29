export const selectAllText = (event: any) => {
    const target = event.target;
    if (target.tagName === "INPUT") {
        target.select();
    }
}