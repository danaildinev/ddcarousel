export function error(msg: string) {
    const err = new Error(msg);

    if ((Error as any).captureStackTrace) {
        (Error as any).captureStackTrace(err, error);
    }

    return err;
}