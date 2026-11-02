# -*- coding: utf-8 -*-
"""
ALL SITE CONTENT LIVES HERE.
Edit this file, then run:  python3 _source/build.py
Items marked  # TODO  still need a real value from you before launch.
"""

BRAND = {
    "name": "Leo Creative Studios",
    "short": "Leo",                                   # used in the logo-reveal and showreel animations
    "company": "Leo Future Software Solutions",       # registered company shown in the footer + legal pages
    "tagline": "Creative Minds. Technical Excellence. Powerful Execution.",
    "positioning": "A multidisciplinary creative production studio bringing together 3D artists, animators, game developers and technology specialists to create extraordinary digital experiences.",
    "since": "2024",
    "email": "info@leocreativestudios.com",           # TODO confirm this inbox exists - all enquiries go here
    "phone": "",                                      # TODO e.g. "+91 98xxx xxxxx" - hidden while empty
    "whatsapp": "",                                   # TODO digits only, e.g. "9198xxxxxxxx" - WhatsApp button hidden while empty
    "domain": "https://www.leocreativestudios.com",
    "location": "Hyderabad, Telangana, India",
    "hours": "Monday – Saturday | 10:00 AM – 7:00 PM IST",
    "form_endpoint": "",   # optional later (Formspree etc.). Empty = form opens the visitor's email app, pre-filled.
}

STUDIOS = [
    {"city": "Hyderabad", "label": "Hyderabad studio", "address": "Street No. 8, Rajendra Nagar, Hyderabad, Telangana", "x": 175, "y": 255},
    {"city": "Hanamakonda", "label": "Hanamakonda studio", "address": "Vidhyanagar, Hanamakonda, Telangana 506002", "x": 285, "y": 150},
]

# demo = which live animation plays beside the service.  form = the label in the contact form's "Type of project" list
SERVICES = [
    {"slug": "3d-animation", "name": "3D Animation, End to End", "short": "3D Animation", "demo": "cube", "form": "3D Animation",
     "tagline": "From the first model to the final render, under one roof.",
     "desc": "Our 3D artists handle the complete animation pipeline, including modelling, texturing, environment design, lighting, scene composition, animation and final rendering.",
     "deliverables": ["Modelling & texturing", "Environment design", "Lighting & scene composition", "Animation & final rendering"],
     "tools": ["Blender", "Unreal Engine"]},
    {"slug": "cinematic-previz", "name": "3D Cinematic Previz", "short": "Cinematic Previz", "demo": "previz", "form": "Cinematic Previsualization",
     "tagline": "See every shot before the cameras roll.",
     "desc": "We transform scripts and creative concepts into visual sequences through scene planning, camera blocking, shot composition and cinematic previsualization.",
     "deliverables": ["Scene planning", "Camera blocking", "Shot composition", "Previs sequences"],
     "tools": ["Blender", "Unreal Engine"]},
    {"slug": "game-assets", "name": "Game Level Design, Assets & Props", "short": "Game Levels & Assets", "demo": "level", "form": "Game Development & Assets",
     "tagline": "Worlds that are ready to play in.",
     "desc": "Our game specialists work on game level design, environment creation, game-ready assets, props and real-time content development.",
     "deliverables": ["Game level design", "Environment creation", "Game-ready assets & props", "Real-time content"],
     "tools": ["Unreal Engine", "Blender"]},
    {"slug": "motion-capture", "name": "Motion Capture Data Solving", "short": "Motion Capture", "demo": "mocap", "form": "Motion Capture",
     "tagline": "Raw mocap in, production-ready animation out.",
     "desc": "Our specialists handle motion capture data solving, cleanup and refinement, helping transform raw motion data into production-ready character animation.",
     "deliverables": ["Mocap data solving", "Cleanup & refinement", "Production-ready character animation"],
     "tools": ["Blender", "Unreal Engine"]},
    {"slug": "character-animation", "name": "Character Animation", "short": "Character Animation", "demo": "face", "form": "Character Animation",
     "tagline": "Characters with personality. (Try moving your cursor.)",
     "desc": "Our animators bring characters to life through expressive movements, performance animation, storytelling and cinematic sequences.",
     "deliverables": ["Expressive performance animation", "Story-driven sequences", "Cinematic character shots"],
     "tools": ["Blender", "Unreal Engine"]},
    {"slug": "architectural-visualization", "name": "Architectural Visualization & Walkthroughs", "short": "Architectural Visualization", "demo": "iso", "form": "Architectural Visualization",
     "tagline": "Walk through a building before it's built.",
     "desc": "We create detailed architectural renders, immersive 3D walkthroughs and virtual property experiences that bring architectural concepts to life.",
     "deliverables": ["Architectural renders", "3D walkthroughs", "Virtual property experiences"],
     "tools": ["Blender", "Unreal Engine"]},
    {"slug": "product-animation", "name": "3D Product Animation & Visualization", "short": "Product Animation", "demo": "phone", "form": "Product Animation",
     "tagline": "Products that look as good as they work.",
     "desc": "From detailed product modelling to realistic materials, lighting and animated presentations, we create engaging visuals that showcase products effectively.",
     "deliverables": ["Detailed product modelling", "Realistic materials & lighting", "Animated product presentations"],
     "tools": ["Blender", "Unreal Engine"]},
    {"slug": "vr-walkthroughs", "name": "VR Walkthroughs & Cinematics", "short": "Unreal Engine & VR", "demo": "grid", "form": "Unreal Engine & VR",
     "tagline": "Real-time worlds people can step inside.",
     "desc": "Our real-time specialists develop Unreal Engine cinematics, interactive environments, VR walkthroughs and immersive digital experiences.",
     "deliverables": ["Unreal Engine cinematics", "Interactive environments", "VR walkthroughs", "Immersive experiences"],
     "tools": ["Unreal Engine", "Blender"]},
    {"slug": "explainer-videos", "name": "Animated Explainer Videos", "short": "Explainer Videos", "demo": "ui", "form": "Explainer Videos",
     "tagline": "Complex ideas, made simple.",
     "desc": "We create engaging AI-assisted, 3D and 2D animated explainer videos that simplify complex ideas, communicate product value and connect with audiences.",
     "deliverables": ["AI-assisted explainers", "3D explainer videos", "2D explainer videos"],
     "tools": ["Blender", "Unreal Engine"]},
]

PROCESS = [
    ("Understand & discover", "We begin by understanding your vision, project requirements, target audience, technical expectations and final objectives."),
    ("Plan & strategise", "Our team defines the production approach, project scope, timeline, deliverables and technical workflow before moving into execution."),
    ("Create & develop", "Our artists, animators, designers and developers work together to transform concepts into high-quality visuals, assets and interactive experiences."),
    ("Review & refine", "We share progress, collect feedback, make agreed revisions and maintain quality checks throughout production."),
    ("Deliver & support", "We complete the final quality checks and deliver the agreed project files, assets and outputs in the required formats."),
]

CLIENTS = [  # logo files live in assets/img/clients/
    {"name": "Narayana Educational Institutions", "logo": "narayana.png", "bg": "#ffffff"},
    {"name": "Perceptyne", "logo": "perceptyne.png", "bg": "#9682e3"},
    {"name": "Pepperfry", "logo": "pepperfry.png", "bg": "#ffffff"},
    {"name": "NAVNI", "logo": "navni.png", "bg": "#ffffff"},
    {"name": "Neoskin", "logo": "neoskin.png", "bg": "#fcf5e5"},
    {"name": "True Biryani", "logo": "true-biryani.png", "bg": "#0a0a09"},
]
CLIENT = {c["name"]: c for c in CLIENTS}

INDUSTRIES = [
    {"slug": "edtech", "name": "EdTech & E-learning", "kind": "waves", "seed": 2,
     "pitch": "Lessons students actually finish.",
     "desc": "Animated lessons, explainers and 3D visuals that make difficult concepts easy to see and remember.",
     "uses": ["Animated video lessons", "3D concept visualisations", "Course and campus explainers", "Brand films for institutions"],
     "services": ["explainer-videos", "3d-animation", "character-animation"], "client": "Narayana Educational Institutions"},
    {"slug": "media-gaming", "name": "Media & Gaming", "kind": "burst", "seed": 5,
     "pitch": "Your outsourced animation department.",
     "desc": "We create 3D models, game-ready assets, cinematic previz, mocap clean-up and character animation for studios, publishers and brands.",
     "uses": ["3D models & game-ready assets", "Level and environment design", "Cinematic previz", "Mocap solving & character animation"],
     "services": ["game-assets", "cinematic-previz", "motion-capture"], "client": "Pepperfry"},
    {"slug": "real-estate", "name": "Real Estate & Construction", "kind": "stack", "seed": 11,
     "pitch": "Sell it before you build it.",
     "desc": "Photoreal renders, walkthroughs and VR tours that let buyers experience a space long before it is finished.",
     "uses": ["Architectural renders", "3D walkthroughs & flythroughs", "VR property tours", "Sales-gallery content"],
     "services": ["architectural-visualization", "vr-walkthroughs", "3d-animation"], "client": "NAVNI"},
    {"slug": "food-tech", "name": "Food & Tech", "kind": "orbits", "seed": 9,
     "pitch": "Create the best 3D visuals.",
     "desc": "Mouth-watering 3D food and product visuals for restaurants, cloud kitchens and consumer tech brands.",
     "uses": ["3D food & product visuals", "Menu and brand animations", "Social media reels", "Packaging visualisation"],
     "services": ["product-animation", "3d-animation", "explainer-videos"], "client": "True Biryani"},
    {"slug": "manufacturing", "name": "Manufacturing & Engineering", "kind": "burst", "seed": 13,
     "pitch": "Show what's inside the product.",
     "desc": "Exploded views, process animations and product visualisations that explain how things are built and how they work.",
     "uses": ["Product & machine animation", "Exploded and cut-away views", "Process visualisation", "Interactive 3D presentations"],
     "services": ["product-animation", "3d-animation", "vr-walkthroughs"], "client": "NAVNI"},
    {"slug": "healthcare", "name": "Healthcare & Pharma", "kind": "rings", "seed": 7,
     "pitch": "Science, made visible.",
     "desc": "Clear 3D visuals of the body, procedures, devices and treatments for doctors, patients and medical brands.",
     "uses": ["Medical & scientific 3D animation", "Device and product visualisation", "Patient education videos", "Clinic and brand explainers"],
     "services": ["3d-animation", "product-animation", "explainer-videos"]}
]

TEAM = [
    {"name": "Rahul", "role": "Head of Production & Animation", "exp": "8 years experience",
     "bio": "Rahul leads our production and animation operations, ensuring every project meets creative and technical expectations. From planning production workflows to guiding artists and maintaining quality, he turns creative concepts into polished final outputs.",
     "photo": "rahul.jpg", "avatar": "rahul-avatar.jpg"},   # TODO add assets/img/team/rahul.jpg and put the file name here
    {"name": "Karthikeya", "role": "Head of Technology & Pipeline Design", "exp": "5 years experience",
     "bio": "Karthikeya drives our technical workflows and production pipelines. He focuses on building efficient processes, integrating tools and technologies, and ensuring smooth collaboration between creative and development teams.",
     "photo": "karthikeya.jpg", "avatar": "karthikeya-avatar.jpg"},
    {"name": "Prudhvi", "role": "Head of Marketing", "exp": "8 years experience",
     "bio": "Prudhvi leads our marketing, client relationships and business development. He connects creative capabilities with client requirements, understands project objectives and builds meaningful partnerships that help the studio grow.",
     "photo": "prudhvi.jpg", "avatar": "prudhvi-avatar.jpg"},
]

CULTURE = [
    ("Collaboration over silos", "Our artists, designers and developers work together rather than operating in isolated departments."),
    ("Creativity with purpose", "Every creative decision has a purpose. We balance artistic vision with project objectives and technical requirements."),
    ("Ownership & accountability", "Every team member takes responsibility for their work, timelines and contribution to the final outcome."),
    ("Continuous improvement", "We keep learning, experimenting and exploring new tools, technologies and production techniques."),
    ("Focused execution", "We value planning, clear communication, consistency and delivering what we commit to."),
]

TECH = [
    ("Blender", "3D modelling, texturing, lighting, animation and rendering"),
    ("Unreal Engine", "Real-time development, cinematics and interactive experiences"),
    ("Supporting tools", "Workflows for modelling, texturing, animation, asset preparation and production"),
]

PARTNERS = ["Businesses & brands", "Production houses", "Animation studios", "Game development companies", "Architects & developers", "Creative & marketing agencies"]
