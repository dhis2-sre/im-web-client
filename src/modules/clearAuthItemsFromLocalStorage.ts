const LOCAL_STORAGE_KEYS = [
    '_auth',
    '_auth_state',
    '_auth_storage',
    '_auth_refresh_time',
    /* Keep `_auth_refresh` in localStorage because it is used to
     * compute the apiRefresh interval. */
    // '_auth_refresh',
    '_auth_type',
]

export const clearAuthItemsFromLocalStorage = () => {
    for (const key of LOCAL_STORAGE_KEYS) {
        localStorage.removeItem(key)
    }
}
