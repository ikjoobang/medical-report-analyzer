const multipart = require('lambda-multipart-parser');
const OpenAI = require('openai').default;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse multipart form data
    const result = await multipart.parse(event);
    
    if (!result.files || result.files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '파일이 업로드되지 않았습니다.' }),
      };
    }

    const file = result.files[0];
    console.log('File received:', file.filename, file.contentType, file.content.length);

    // Convert to base64
    const base64Image = file.content.toString('base64');
    const dataUrl = `data:${file.contentType};base64,${base64Image}`;

    // Prepare prompt for OpenAI Vision
    const prompt = `당신은 의료 영상 판독 전문가입니다. 첨부된 의료 검사 결과지를 분석하여 다음 정보를 추출해주세요.

반드시 아래 JSON 형식으로 응답해주세요:

{
  "patientInfo": {
    "patientId": "환자 ID (예: 00002448)",
    "name": "환자 이름 (있는 경우, 없으면 빈 문자열)",
    "age": "나이 (예: 70세, 없으면 빈 문자열)",
    "gender": "성별 (M/F, 없으면 빈 문자열)",
    "birthDate": "생년월일 (있는 경우)"
  },
  "examInfo": {
    "examType": "검사 종류 (예: Brain MRI)",
    "examPart": "검사 부위 (예: 뇌, 복부 등)",
    "examDate": "검사 날짜 (YYYY-MM-DD 형식)",
    "hospital": "병원명 (있는 경우)",
    "referringPhysician": "의뢰 의사 (있는 경우)",
    "readingPhysician": "판독 의사 (있는 경우)"
  },
  "findings": [
    {
      "category": "소견 카테고리 (예: 뇌실질, 혈관, 구조물 등)",
      "description": "상세 소견 설명",
      "isNormal": true/false,
      "severity": "정상/경증/중등도/중증"
    }
  ],
  "impression": {
    "summary": "판독 의견 요약",
    "diagnosis": "주요 진단명 (있는 경우)",
    "overallSeverity": "정상/경증/중등도/중증"
  },
  "medicalTerms": [
    {
      "term": "의학 용어 (영문 또는 한문)",
      "explanation": "쉬운 한글 설명"
    }
  ],
  "recommendations": {
    "followUp": "추천 후속 조치 (예: 정기 검진, 추가 검사 등)",
    "department": "추천 진료과 (있는 경우)",
    "urgency": "긴급도 (낮음/중간/높음)",
    "notes": "기타 주의사항"
  }
}

중요 지침:
1. 문서에서 직접 확인되는 정보만 추출하세요.
2. 확인되지 않는 정보는 빈 문자열("")로 표시하세요.
3. 의학 용어는 일반인이 이해할 수 있도록 쉽게 설명하세요.
4. 심각도 평가는 소견 내용을 바탕으로 합리적으로 판단하세요.
5. 반드시 유효한 JSON 형식으로만 응답하세요.`;

    console.log('Sending request to OpenAI Vision API...');

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    console.log('OpenAI response received');

    const analysisText = response.choices[0].message.content;
    
    // Extract JSON from response
    let analysisData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'AI 응답 파싱 오류',
          details: 'OpenAI 응답을 처리하는 중 오류가 발생했습니다.'
        }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: analysisData,
        metadata: {
          fileName: file.filename,
          fileSize: file.content.length,
          analyzedAt: new Date().toISOString(),
          model: 'gpt-4o'
        }
      }),
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '분석 중 오류가 발생했습니다.',
        details: error.message 
      }),
    };
  }
};
