async function checkSettings() {
    try {
        const resBackend = await fetch('http://localhost:5001/api/settings');
        if (!resBackend.ok) {
            console.error('Failed to fetch from backend:', resBackend.status, resBackend.statusText);
            return;
        }
        const data = await resBackend.json();

        console.log('--- ALL SETTINGS ---');
        // console.log(JSON.stringify(data, null, 2));

        const timerSetting = data.find(s => s.key === 'timer_active');
        console.log('\n--- TIMER SETTING ---');
        console.log('timer_active:', timerSetting);

    } catch (error) {
        console.error('Error fetching settings:', error);
    }
}

checkSettings();
