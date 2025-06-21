import { Router } from 'express';

const router = Router();

router.get("/", (req, res) => {
    console.log("Healthcheck endpoint hit");
    res.status(200).json({ status: "ok" });
});

export default router;