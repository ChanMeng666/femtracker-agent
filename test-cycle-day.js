// 测试脚本：验证 cycle day 数据加载
// 在浏览器控制台中运行

async function testCycleDayLoading() {
  console.log('=== Testing Cycle Day Loading ===');
  
  // 模拟 REST API 调用
  const baseUrl = 'http://localhost:3000';
  const userId = 'd583a572-0d57-4af8-8f04-436e24f3d8da';
  
  try {
    // 获取认证token
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.error('No auth token found');
      return;
    }
    
    const tokenData = JSON.parse(token);
    const headers = {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Profile': 'public'
    };
    
    console.log('Using headers:', headers);
    
    // 查询 quick_records
    const response = await fetch(`${baseUrl}/api/supabase-rest?table=quick_records&select=*&user_id=eq.${userId}&record_type=eq.current_cycle_day&order=date.desc&limit=1`, {
      headers
    });
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data && data.length > 0) {
      const record = data[0];
      console.log('Found record:', record);
      console.log('Cycle day:', record.value);
      console.log('Date:', record.date);
      console.log('Notes:', record.notes);
    } else {
      console.log('No records found');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// 运行测试
testCycleDayLoading(); 