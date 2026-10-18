// Measured from the existing public images; intrinsic dimensions prevent layout shifts.
const dimensions: Record<string, { width: number; height: number }> = {
  "/projects/eventies/cover.webp": {
    "width": 1600,
    "height": 1000
  },
  "/projects/eventies/screenshot-01.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/eventies/screenshot-02.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/eventies/screenshot-03.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/eventies/screenshot-04.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/eventies/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 200
  },
  "/projects/eventies/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 400
  },
  "/projects/glitzz-lab/cover.webp": {
    "width": 1600,
    "height": 1000
  },
  "/projects/glitzz-lab/screenshot-01.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/screenshot-02.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/screenshot-03.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/screenshot-04.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/screenshot-05.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/screenshot-06.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/screenshot-07.webp": {
    "width": 1920,
    "height": 1200
  },
  "/projects/glitzz-lab/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 200
  },
  "/projects/glitzz-lab/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 400
  },
  "/projects/umniah-youthconnect/cover.webp": {
    "width": 1448,
    "height": 1086
  },
  "/projects/umniah-youthconnect/screenshot-01.webp": {
    "width": 1805,
    "height": 1047
  },
  "/projects/umniah-youthconnect/screenshot-02.webp": {
    "width": 1841,
    "height": 1046
  },
  "/projects/umniah-youthconnect/screenshot-03.webp": {
    "width": 1801,
    "height": 1044
  },
  "/projects/umniah-youthconnect/screenshot-04.webp": {
    "width": 1777,
    "height": 1000
  },
  "/projects/umniah-youthconnect/screenshot-05.webp": {
    "width": 1775,
    "height": 1000
  },
  "/projects/umniah-youthconnect/screenshot-06.webp": {
    "width": 1782,
    "height": 999
  },
  "/projects/umniah-youthconnect/screenshot-07.webp": {
    "width": 1780,
    "height": 995
  },
  "/projects/umniah-youthconnect/screenshot-08.webp": {
    "width": 1787,
    "height": 1016
  },
  "/projects/umniah-youthconnect/screenshot-09.webp": {
    "width": 1830,
    "height": 1055
  },
  "/projects/umniah-youthconnect/screenshot-10.webp": {
    "width": 1813,
    "height": 1027
  },
  "/projects/umniah-youthconnect/screenshot-11.webp": {
    "width": 1841,
    "height": 1048
  },
  "/projects/umniah-youthconnect/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 240
  },
  "/projects/umniah-youthconnect/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 480
  },
  "/projects/the-terminal-nfc/cover.webp": {
    "width": 1586,
    "height": 992
  },
  "/projects/the-terminal-nfc/screenshot-01.webp": {
    "width": 1586,
    "height": 992
  },
  "/projects/the-terminal-nfc/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 200
  },
  "/projects/the-terminal-nfc/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 400
  },
  "/projects/bike-tower/cover.webp": {
    "width": 1331,
    "height": 1000
  },
  "/projects/bike-tower/screenshot-01.webp": {
    "width": 1920,
    "height": 1080
  },
  "/projects/bike-tower/screenshot-02.webp": {
    "width": 1920,
    "height": 1080
  },
  "/projects/bike-tower/screenshot-03.webp": {
    "width": 1920,
    "height": 1080
  },
  "/projects/bike-tower/screenshot-04.webp": {
    "width": 1920,
    "height": 1080
  },
  "/projects/bike-tower/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 241
  },
  "/projects/bike-tower/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 481
  },
  "/projects/basket-beats/cover.webp": {
    "width": 960,
    "height": 540
  },
  "/projects/basket-beats/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 180
  },
  "/projects/basket-beats/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 360
  },
  "/projects/vr-cycling/cover.webp": {
    "width": 1586,
    "height": 992
  },
  "/projects/vr-cycling/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 200
  },
  "/projects/vr-cycling/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 400
  },
  "/projects/bike-land-smart-cycling-trainer/cover.webp": {
    "width": 1586,
    "height": 992
  },
  "/projects/bike-land-smart-cycling-trainer/screenshot-01.webp": {
    "width": 1586,
    "height": 992
  },
  "/projects/bike-land-smart-cycling-trainer/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 200
  },
  "/projects/bike-land-smart-cycling-trainer/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 400
  },
  "/projects/financial-operations/cover.svg": {
    "width": 1600,
    "height": 1000
  },
  "/projects/outreach-automation-platform/cover.svg": {
    "width": 1600,
    "height": 1000
  },
  "/projects/outreach-automation-platform/workflow.svg": {
    "width": 1600,
    "height": 1000
  },
  "/projects/traffic-flow-analytics-studio/cover.webp": {
    "width": 1572,
    "height": 942
  },
  "/projects/traffic-flow-analytics-studio/card-cover-thumb-320.webp": {
    "width": 320,
    "height": 192
  },
  "/projects/traffic-flow-analytics-studio/card-cover-thumb-640.webp": {
    "width": 640,
    "height": 383
  },
  // Owner-supplied project covers (18 Oct 2026), served from /covers/ in four widths.
  "/covers/vr-cycling.webp": {
    "width": 1448,
    "height": 1086
  },
  "/covers/vr-cycling-960.webp": {
    "width": 960,
    "height": 720
  },
  "/covers/vr-cycling-640.webp": {
    "width": 640,
    "height": 480
  },
  "/covers/vr-cycling-320.webp": {
    "width": 320,
    "height": 240
  },
  "/covers/bike-land-trainer.webp": {
    "width": 1448,
    "height": 1086
  },
  "/covers/bike-land-trainer-960.webp": {
    "width": 960,
    "height": 720
  },
  "/covers/bike-land-trainer-640.webp": {
    "width": 640,
    "height": 480
  },
  "/covers/bike-land-trainer-320.webp": {
    "width": 320,
    "height": 240
  },
  "/covers/eventies.webp": {
    "width": 1600,
    "height": 960
  },
  "/covers/eventies-960.webp": {
    "width": 960,
    "height": 576
  },
  "/covers/eventies-640.webp": {
    "width": 640,
    "height": 384
  },
  "/covers/eventies-320.webp": {
    "width": 320,
    "height": 192
  },
  "/covers/glitzz-lab.webp": {
    "width": 1600,
    "height": 836
  },
  "/covers/glitzz-lab-960.webp": {
    "width": 960,
    "height": 501
  },
  "/covers/glitzz-lab-640.webp": {
    "width": 640,
    "height": 334
  },
  "/covers/glitzz-lab-320.webp": {
    "width": 320,
    "height": 167
  },
  "/covers/outreach-automation.webp": {
    "width": 1600,
    "height": 902
  },
  "/covers/outreach-automation-960.webp": {
    "width": 960,
    "height": 541
  },
  "/covers/outreach-automation-640.webp": {
    "width": 640,
    "height": 361
  },
  "/covers/outreach-automation-320.webp": {
    "width": 320,
    "height": 180
  },
  "/covers/terminal-nfc.webp": {
    "width": 1600,
    "height": 902
  },
  "/covers/terminal-nfc-960.webp": {
    "width": 960,
    "height": 541
  },
  "/covers/terminal-nfc-640.webp": {
    "width": 640,
    "height": 361
  },
  "/covers/terminal-nfc-320.webp": {
    "width": 320,
    "height": 180
  },
  "/covers/financial-operations.webp": {
    "width": 1600,
    "height": 900
  },
  "/covers/financial-operations-960.webp": {
    "width": 960,
    "height": 540
  },
  "/covers/financial-operations-640.webp": {
    "width": 640,
    "height": 360
  },
  "/covers/financial-operations-320.webp": {
    "width": 320,
    "height": 180
  },
  "/covers/traffic-flow-analytics.webp": {
    "width": 1600,
    "height": 900
  },
  "/covers/traffic-flow-analytics-960.webp": {
    "width": 960,
    "height": 540
  },
  "/covers/traffic-flow-analytics-640.webp": {
    "width": 640,
    "height": 360
  },
  "/covers/traffic-flow-analytics-320.webp": {
    "width": 320,
    "height": 180
  },
  "/covers/umniah-youthconnect.webp": {
    "width": 1600,
    "height": 903
  },
  "/covers/umniah-youthconnect-960.webp": {
    "width": 960,
    "height": 542
  },
  "/covers/umniah-youthconnect-640.webp": {
    "width": 640,
    "height": 361
  },
  "/covers/umniah-youthconnect-320.webp": {
    "width": 320,
    "height": 181
  }
};
export default dimensions;
