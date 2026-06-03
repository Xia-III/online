<template>
    <button class="chat-button">
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z" />
        </svg>
    </button>
</template>

<style scoped>
.chat-button {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #1890ff;
    color: white;
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: all 0.3s ease;
}

.chat-button:hover {
    background-color: #40a9ff;
    transform: scale(1.05);
}
</style>