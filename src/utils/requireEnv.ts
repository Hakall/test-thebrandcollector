const requireEnv = <T = string>(
    envVar: string,
    {
        defaultValue,
        required = true,
    }: {
        defaultValue?: T;
        required?: boolean;
    } = {}
) => {
    const value = process.env[envVar];

    if (
        (process.env.NODE_ENV === "production" && !value && required) ||
        (value === undefined &&
            defaultValue === undefined &&
            process.env.NODE_ENV !== "test")
    ) {
        console.error(`[ENVIRONMENT]: \`${envVar}\` variables is required.`);
        throw new TypeError(`[ENVIRONMENT]: \`${envVar}\` variables is required.`);
    } else if (!value && !defaultValue && process.env.NODE_ENV !== "test") {
        console.warn(
            `[ENVIRONMENT]: There is no value or default value for \`${envVar}\`.`
        );
    }

    return (value || defaultValue) as T;
};

export { requireEnv };
