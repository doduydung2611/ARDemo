document.addEventListener("DOMContentLoaded", async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.querySelector("#ar-container"),
        imageTargetSrc: "targets.mind"
    });

    const { renderer, scene, camera } = mindarThree;
    const anchor1 = mindarThree.addAnchor(0);
    const anchor2 = mindarThree.addAnchor(1);

    const overlayHint = document.getElementById("overlay-hint");
    const overlayClick = document.getElementById("overlay-click");

    // overlayHint.style.display = "block"; (bỏ tự hiển thị lúc load) // Hiện ngay khi load trang

    let userInteracted = false;
    let anchor1Visible = false;
    let anchor2Visible = false;
    const videoPositions = {
        vid1: parseFloat(sessionStorage.getItem("vid1")) || 0,
        vid2: parseFloat(sessionStorage.getItem("vid2")) || 0
    };

    const createVideo = (src, geometry) => {
        const video = document.createElement("video");
        video.src = src;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.playsInline = true;
        video.autoplay = false;
        video.muted = true;
        video.controls = false;
        video.load(); // Ensure preload on Safari
        const texture = new THREE.VideoTexture(video);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        return { video, mesh };
    };

    const scale1 = 0.58;
    const scale2 = 0.78;
    const vid1 = createVideo("Vid1.mp4", new THREE.PlaneGeometry(1.778 * scale1, 1 * scale1));
    const vid2 = createVideo("Vid2.mp4", new THREE.PlaneGeometry(1.33 * scale2, 1 * scale2));

    anchor1.group.add(vid1.mesh);
    anchor2.group.add(vid2.mesh);

    const handleUserInteraction = () => {
        userInteracted = true;

        // Ẩn các overlay ngay lập tức
        overlayClick.style.display = "none";


        vid1.video.muted = false;
        vid2.video.muted = false;
        if (anchor1Visible) vid1.video.play();
        if (anchor2Visible) vid2.video.play();

        document.body.removeEventListener("click", handleUserInteraction);
        document.body.removeEventListener("touchstart", handleUserInteraction);
    };

    document.body.addEventListener("click", handleUserInteraction);
    document.body.addEventListener("touchstart", handleUserInteraction);

    anchor1.onTargetFound = () => {
        anchor1Visible = true;
        vid1.video.currentTime = videoPositions.vid1 || 0;

        if (!userInteracted) {
            overlayHint.style.display = "none";
            overlayClick.style.display = "block";
        }

        if (userInteracted) {
            vid1.video.play();
            overlayHint.style.display = "none";
        }
    };

    anchor1.onTargetLost = () => {
        anchor1Visible = false;
        overlayClick.style.display = "none";
        overlayHint.style.display = "block";
        videoPositions.vid1 = vid1.video.currentTime;
        sessionStorage.setItem("vid1", videoPositions.vid1);
        vid1.video.pause();
    };

    anchor2.onTargetFound = () => {
        anchor2Visible = true;
        vid2.video.currentTime = videoPositions.vid2 || 0;

        if (!userInteracted) {
            overlayHint.style.display = "none";
            overlayClick.style.display = "block";
        }

        if (userInteracted) {
            vid2.video.play();
            overlayHint.style.display = "none";
        }
    };
    anchor2.onTargetLost = () => {
        anchor2Visible = false;
        overlayClick.style.display = "none";
        overlayHint.style.display = "block";
        videoPositions.vid2 = vid2.video.currentTime;
        sessionStorage.setItem("vid2", videoPositions.vid2);
        vid2.video.pause();
    };

    const adjustRendererSize = () => {
        const container = document.querySelector("#ar-container");
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        vid1.mesh.rotation.set(0, 0, 0);
        vid2.mesh.rotation.set(0, 0, 0);
        vid1.mesh.scale.set(1, 1, 1);
        vid2.mesh.scale.set(1, 1, 1);
    };

    window.addEventListener("resize", adjustRendererSize);
    await mindarThree.start();
    // Nếu không thấy marker nào sau 1.5s thì hiển thị gợi ý
    setTimeout(() => {
        if (!anchor1Visible && !anchor2Visible && !userInteracted) {
            overlayHint.style.display = "block";
        }
    }, 1500);
    adjustRendererSize();

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
});