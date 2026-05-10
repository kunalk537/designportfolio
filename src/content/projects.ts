/**
 * Each project appears on the home page in order.
 *
 * `media` is an array of strings or objects.
 *
 * Strings are auto-detected by extension
 * (.mp4 / .webm / .mov / .m4v / .ogg / .ogv → video, anything else → image).
 *
 * Use the object form to add a `caption` (shown only in the "Look closer"
 * lightbox), a custom `alt`, a video `poster`, or to override the `type`:
 *
 *   {
 *     src: '/rift3.mp4',
 *     type: 'video',                 // optional, auto-detected
 *     caption: 'Auton routine demo', // shown in the lightbox
 *     poster: '/rift-poster.jpg',    // optional video thumbnail
 *     alt: 'Robot during competition match', // optional, defaults to project title
 *   }
 *
 * Layout: first 2 items are shown full-size in the card. If there are more,
 * the column becomes scrollable with an animated "Scroll for more" indicator.
 */
export type MediaInput =
  | string
  | {
      src: string
      type?: 'image' | 'video'
      caption?: string
      poster?: string
      alt?: string
    }

export type Project = {
  id: string
  title: string
  summary: string
  tags: string[]
  media: MediaInput[]
  paragraphs: string[]
}

export const projects: Project[] = [
  {
    id: 'semiconductor',
    title: 'Object Detection for Semiconductor Wafers',
    summary:
      'A binary classification system, 1600 image augmented dataset, custom YoloV9 model training, semiconductor manufacturing.',
    tags: [
      'Computer Vision',
      'Dataset Creation',
      'Model Training',
      'Performance Metric Analysis',
    ],
    media: [
      '/semiconductor3.jpg',
      '/semiconductor1.jpg',
      '/semiconductor2.png',
      '/semiconductor4.png',
    ],
    paragraphs: [
      'Improper wafer alignment during semiconductor manufacturing decreases yield, with current solutions being expensive and physically bulky; CV as a solution.',
      'Built dataset using microscope images, annotated with bounding boxes(p: perfectly aligned, n: not aligned) to create 560 image dataset. Heavy class imbalance necessitated augmentation with grayscale, rotation, and color corrections; 1600 images in total.',
      'Custom YoloV9 model trained on dataset with 80/10/10 split for training, validation, and test; Training done on Google Colab with 1000 epochs, batch size -1, patience 15, + more; Trained + tested on A100 GPU through Google Colab.',
      'Performance metrics calculated with confusion matrix and accuracy, precision, recall, and F1 score. Model achieved F1 of .95, Precision of .962, Recall of .936, overall accuracy of .95.',
      'Stack: Dataset Managment, YOLO V9, Computer Vision Pipeline, Python, Google Colab, A100 GPU, Results Analysis, Class Imbalance Handling',
    ],
  },
  {
    id: 'riftrobotics',
    title: 'FTC Into the Deep Competition Robot',
    summary:
      '5000+ part assembly, 3D Printing + CNC, Odometry and CV localization, autonomous navigation.',
    tags: [
      'DFM',
      'Team Leadership',
      '3D Design',
      'Wiring',
      'Java',
      'C/C++',
      'Soldering',
    ],
    media: [
      '/rift3.mp4',
      '/rift1.png',
      '/rift2.png',
      '/riftresume.png',
    ],
    paragraphs: [
      'Chassis: Belt-driven mecanum wheel drivetrain with 4x 12V 435 RPM DC motors at 1:1 ratio, with two-wheel sprung odometry for precise mapping of field movements. Custom CNC-milled aluminum + polycarbonate chassis to balance weight and structural integrity.',
      'Intake: Servo-powered linkage driving 3-stage linear slides to intake game pieces at distance. Virtual four-bar geared 2:1 for speedy movement of claw, which has computer vision controlled-yaw to align with rectangular game pieces.',
      'Outtake: Four-stage linear slides driven by 2x 12V 312 RPM DC motors with pulley system and kevlar cascade stringing. Second virtual four-bar geared 1:1 with claw to quickly deposit game pieces into basket.',
      'Stack: 3D Printing, CNC Milling, Design + Prototyping, Assembly, Soldering, Wiring, Physics + Kinematics, Iteration, Component Selection',
    ],
  },
  {
    id: 'nova',
    title: 'Wheeled Self-Balancing Humanoid Robot Prototype',
    summary:
      'Dual-reaction wheel stabilizer, IMU fall detection, custom 3D-printed chassis, high-torque gearbox.',
    tags: ['Motor Control', 'Sensor Fusion', 'Raspberry Pi', 'CAN', 'Python', 'Soldering', 'Crimping', '3D Printing', 'CAD'],
    media: ['/nova1.png', '/nova3.png', '/nova2.png'],
    paragraphs: [
      'Reaction wheel system 3D-printed with steel dowels around the edges as weight, perpendicular design enables torque in x and y axis; powered by 180KV motors at 24V, controlled by ODrive S1 over CANbus.',
      'Raspberry Pi used as microcontroller for complex inverse kinematics and controls equations, connected to IMU data via I2C and processing it + computer vision pipeline onboard.',
      'Custom gearbox for driving wheels at 1:8 ratio to maintain stability and torque, utilizing existing motors in slim form-factor through printed modular shell, spur gears, and ball bearings.',
      'Stack: Motor Control, Sensor Fusion, Raspberry Pi, CANbus, Python, Soldering, Crimping, 3D Printing, CAD, Inverse Kinematics, Controls Equations',
    ],
  },
  {
    id: 'snosight',
    title: 'ESP32-Based PCB for AR Ski Goggles',
    summary:
      'IMU feedback tuned with PID, OLED display with I2C protocol, battery monitoring + charging in 3D-printed case.',
    tags: ['Embedded', 'PCB Design', 'Smartphone Integration', 'I2C', 'C/C++', 'Soldering'],
    media: ['/snosight2d.png', '/snosight3d.png', '/snosight3.png'],
    paragraphs: [
      'Prototyped on a perfboard with an ESP32 devboard, moved to PCB to minimize form factor and fit in goggles.',
      'USB-C connector for convenience and future expansion; serves as power source for built-in 3.7V Li-ion battery charging and serial communication port for flashing.',
      'ICM-20948 sensor for IMU feedback with voltage stepped down from 3.3V to 1.8V logic levels; OLED display to create augmented reality effect for information display, both I2C communication',
      '4-layer board (signal, ground, 3.3V, signal) to minimize EMI and maintain impedance, using JLCPCB and component selection through LCSC parts.',
      'Stack: Schematic Design, Component Selection, EasyEDA, ESP32, MPU9050, OLED Display, USB-C Connector, Li-ion Battery, TP4056 Charger, 3D-printed Case',
    ],
  },
]
