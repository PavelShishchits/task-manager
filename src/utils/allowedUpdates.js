const updateIsAllowed = (updates, allowedUpdates) => {
    return updates.every((item) => allowedUpdates.includes(item));
}

module.exports = updateIsAllowed;